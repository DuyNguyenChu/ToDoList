using Microsoft.EntityFrameworkCore;
using BE.Models;
using BE.repositories.ItemRepo;
using BE.Services.ItemService;
using BE.repositories.ItemInformationRepo;
using BE.Services.ItemInformationService;
using BE.repositories.RoleRepo;
using BE.Services.RoleService;
using BE.repositories.StoreRepo;
using BE.Services.StoreService;
using BE.repositories.StoresItemsItemInformationRepo;
using BE.Services.StoresItemsItemInformationService;
using BE.repositories.ToDoListRepo;
using BE.Services.ToDoListService;
using BE.repositories.UserRepo;
using BE.Services.UserService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BE.repositories.Authen;
using BE.Services.AuthenService;
using BE.Services.CloudinaryService;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "https://do-can-mua-to-do-list.vercel.app"
              )
              .SetIsOriginAllowed(origin =>
                  origin.StartsWith("http://localhost") ||
                  origin.EndsWith(".vercel.app"))
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();

builder.Services.AddDbContextPool<ToDolistContext>(options =>
{
    var rawConnection = builder.Configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
    var npgsqlConnection = BuildNpgsqlConnectionString(rawConnection);
    options.UseNpgsql(npgsqlConnection, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorCodesToAdd: null);
    });
});

builder.Services.AddScoped<IItemRepository, ItemRepository>();
builder.Services.AddScoped<IItemService, ItemService>();
builder.Services.AddScoped<IItemInformationRepository, ItemInformationRepository>();
builder.Services.AddScoped<IItemInformationService, ItemInformationService>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IStoreRepository, StoreRepository>();
builder.Services.AddScoped<IStoreService, StoreService>();
builder.Services.AddScoped<IStoresItemsItemInformationRepository, StoresItemsItemInformationRepository>();
builder.Services.AddScoped<IStoresItemsItemInformationService, StoresItemsItemInformationService>();
builder.Services.AddScoped<IToDoListRepository, ToDoListRepository>();
builder.Services.AddScoped<IToDoListService, ToDoListService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthenRepository, AuthenRepository>();
builder.Services.AddScoped<IAuthenService, AuthenService>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddSingleton<BE.Services.OnlineService.OnlineTracker>();


var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"];

if (string.IsNullOrEmpty(secretKey))
{
    throw new Exception("JWT secret key is not configured.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "MyAuthServer",
        ValidAudience = jwtSettings["Audience"] ?? "MyAuthClient",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (string.IsNullOrEmpty(context.Token) && context.Request.Cookies.ContainsKey("jwt"))
            {
                context.Token = context.Request.Cookies["jwt"];
            }

            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hub"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddSignalR();

var app = builder.Build();

try
{
    using var startupScope = app.Services.CreateScope();
    var dbContext = startupScope.ServiceProvider.GetRequiredService<ToDolistContext>();
    await dbContext.Users.ExecuteUpdateAsync(u => u.SetProperty(x => x.IsOnline, false));
}
catch (Exception ex)
{
    Console.WriteLine($"[Startup] Lỗi đặt lại IsOnline: {ex.Message}");
}

// Configure the HTTP request pipeline.
app.MapOpenApi();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ToDoList API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowReact");

app.UseAuthentication();

app.UseAuthorization();

app.MapHub<BE.Hubs.AppHub>("/hub/todolist");
app.MapHub<BE.Hubs.AppHub>("/hub/app");

app.MapControllers();

app.Run();

static string BuildNpgsqlConnectionString(string raw)
{
    if (string.IsNullOrWhiteSpace(raw)) return raw;

    raw = raw.Trim().Trim('"').Trim('\'');

    // Chuyển đổi định dạng URI postgresql:// sang Key=Value chuẩn của ADO.NET Npgsql
    if (raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
        raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
    {
        try
        {
            var uri = new Uri(raw);
            var userInfo = uri.UserInfo.Split(':', 2);
            var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : string.Empty;
            var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
            var port = uri.Port > 0 ? uri.Port : 5432;
            var database = uri.AbsolutePath.TrimStart('/');
            if (string.IsNullOrEmpty(database)) database = "postgres";

            return $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
        }
        catch
        {
            return raw;
        }
    }

    // Nếu đã là chuỗi Key=Value, đảm bảo bật SSL Mode=Require cho Supabase
    if (!raw.Contains("SSL Mode", StringComparison.OrdinalIgnoreCase))
    {
        raw = raw.TrimEnd(';') + ";SSL Mode=Require;Trust Server Certificate=true;";
    }

    return raw;
}



