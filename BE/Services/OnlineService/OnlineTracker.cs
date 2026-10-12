using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Services.OnlineService
{
    public class OnlineTracker
    {
        private static readonly ConcurrentDictionary<string, HashSet<string>> OnlineUsers 
            = new ConcurrentDictionary<string, HashSet<string>>();

        public Task<bool> UserConnected(string userId, string connectionId)
        {
            bool isFirstConnection = false;
            lock (OnlineUsers)
            {
                if (!OnlineUsers.ContainsKey(userId))
                {
                    OnlineUsers[userId] = new HashSet<string>();
                    isFirstConnection = true;
                }
                OnlineUsers[userId].Add(connectionId);
            }
            return Task.FromResult(isFirstConnection);
        }

        public Task<bool> UserDisconnected(string userId, string connectionId)
        {
            bool isCompletelyOffline = false;
            lock (OnlineUsers)
            {
                if (OnlineUsers.ContainsKey(userId))
                {
                    OnlineUsers[userId].Remove(connectionId);
                    if (OnlineUsers[userId].Count == 0)
                    {
                        OnlineUsers.TryRemove(userId, out _);
                        isCompletelyOffline = true;
                    }
                }
            }
            return Task.FromResult(isCompletelyOffline);
        }

        public Task<string[]> GetOnlineUsers()
        {
            lock (OnlineUsers)
            {
                return Task.FromResult(OnlineUsers.Keys.ToArray());
            }
        }

        public Task<bool> IsUserOnline(string userId)
        {
            lock (OnlineUsers)
            {
                return Task.FromResult(OnlineUsers.ContainsKey(userId) && OnlineUsers[userId].Count > 0);
            }
        }
    }
}
