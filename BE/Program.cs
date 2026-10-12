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
        policy.WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); 
    });
});

builder.Services.AddControllers();

builder.Services.AddDbContextPool<ToDolistContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"), npgsqlOptions =>
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
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReact");

app.UseAuthentication();

app.UseAuthorization();

app.MapHub<BE.Hubs.AppHub>("/hub/todolist");
app.MapHub<BE.Hubs.AppHub>("/hub/app");

app.MapControllers();

app.Run();



