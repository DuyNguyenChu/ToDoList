using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using BE.Models;
using BE.Services.OnlineService;

namespace BE.Hubs
{
    public class AppHub : Hub
    {
        private readonly OnlineTracker _onlineTracker;
        private readonly IServiceScopeFactory _scopeFactory;

        public AppHub(OnlineTracker onlineTracker, IServiceScopeFactory scopeFactory)
        {
            _onlineTracker = onlineTracker;
            _scopeFactory = scopeFactory;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier 
                ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? Context.User?.FindFirst("sub")?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");

                var isFirstConnection = await _onlineTracker.UserConnected(userId, Context.ConnectionId);
                if (isFirstConnection && Guid.TryParse(userId, out var userGuid))
                {
                    await UpdateUserDbOnlineStatus(userGuid, true);

                    await Clients.Others.SendAsync("UserIsOnline", userId);
                }
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier 
                ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? Context.User?.FindFirst("sub")?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");

                var isCompletelyOffline = await _onlineTracker.UserDisconnected(userId, Context.ConnectionId);
                if (isCompletelyOffline && Guid.TryParse(userId, out var userGuid))
                {
                    await UpdateUserDbOnlineStatus(userGuid, false);

                    await Clients.Others.SendAsync("UserIsOffline", userId);
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task<string[]> GetOnlineUsers()
        {
            return await _onlineTracker.GetOnlineUsers();
        }

        public async Task JoinGroup(string groupName)
        {
            if (!string.IsNullOrWhiteSpace(groupName))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            }
        }

        public async Task LeaveGroup(string groupName)
        {
            if (!string.IsNullOrWhiteSpace(groupName))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            }
        }

        private async Task UpdateUserDbOnlineStatus(Guid userId, bool isOnline)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ToDolistContext>();
                var user = await dbContext.Users
                    .Include(u => u.Roles)
                    .FirstOrDefaultAsync(u => u.UserId == userId);

                if (user != null)
                {
                    user.IsOnline = isOnline;

                    if (isOnline && user.UserRoleEndDate.HasValue && user.UserRoleEndDate.Value <= DateTime.UtcNow)
                    {
                        var defaultUserRole = await dbContext.Roles.FirstOrDefaultAsync(r => r.RolesName == "User");
                        if (defaultUserRole != null && user.RolesId != defaultUserRole.RolesId)
                        {
                            user.RolesId = defaultUserRole.RolesId;
                            user.Roles = defaultUserRole;
                            user.UserRoleStartDate = DateTime.UtcNow;
                            user.UserRoleEndDate = null;
                        }
                    }

                    await dbContext.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AppHub] Lỗi cập nhật IsOnline / vai trò trong DB cho User {userId}: {ex.Message}");
            }
        }
    }
}
