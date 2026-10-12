using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using BE.DTOs.CloudinaryDto;

namespace BE.Services.CloudinaryService
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IConfiguration configuration)
        {
            var rawCloudName = configuration["CloudinarySettings:CloudName"] ?? string.Empty;
            var apiKey = configuration["CloudinarySettings:ApiKey"] ?? string.Empty;
            var apiSecret = configuration["CloudinarySettings:ApiSecret"] ?? string.Empty;

            var cloudName = rawCloudName;
            if (rawCloudName.StartsWith("CLOUDINARY_URL=", StringComparison.OrdinalIgnoreCase) ||
                rawCloudName.Contains("cloudinary://", StringComparison.OrdinalIgnoreCase))
            {
                var urlStr = rawCloudName.Replace("CLOUDINARY_URL=", "", StringComparison.OrdinalIgnoreCase).Trim();
                try
                {
                    var uri = new Uri(urlStr);
                    cloudName = uri.Host;
                    if (string.IsNullOrEmpty(apiKey) && !string.IsNullOrEmpty(uri.UserInfo))
                    {
                        var userParts = uri.UserInfo.Split(':');
                        apiKey = userParts[0];
                        if (userParts.Length > 1 && string.IsNullOrEmpty(apiSecret))
                        {
                            apiSecret = userParts[1];
                        }
                    }
                }
                catch
                {
                    if (rawCloudName.Contains('@'))
                    {
                        cloudName = rawCloudName.Substring(rawCloudName.IndexOf('@') + 1).Trim();
                    }
                }
            }
            else if (rawCloudName.Contains('@'))
            {
                cloudName = rawCloudName.Substring(rawCloudName.IndexOf('@') + 1).Trim();
            }

            if (string.IsNullOrWhiteSpace(cloudName) || string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(apiSecret))
            {
                throw new InvalidOperationException("Thông tin cấu hình Cloudinary (CloudName, ApiKey, ApiSecret) chưa được thiết lập chính xác.");
            }

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        public async Task<CloudinaryUploadResultDto> UploadImageAsync(IFormFile file, string? folder = null)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File tải lên không hợp lệ hoặc rỗng.");
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedExtensions = new HashSet<string> { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg" };
            if (!allowedExtensions.Contains(extension))
            {
                throw new ArgumentException("Định dạng file không được hỗ trợ. Vui lòng chọn ảnh (.jpg, .jpeg, .png, .webp, .gif, .bmp, .svg).");
            }

            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = string.IsNullOrWhiteSpace(folder) ? "todolist/items" : folder.Trim(),
                DisplayName = Path.GetFileNameWithoutExtension(file.FileName)
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null)
            {
                throw new Exception($"Lỗi tải ảnh lên Cloudinary: {uploadResult.Error.Message}");
            }

            return new CloudinaryUploadResultDto
            {
                PublicId = uploadResult.PublicId,
                Url = uploadResult.Url?.ToString() ?? string.Empty,
                SecureUrl = uploadResult.SecureUrl?.ToString() ?? string.Empty,
                Format = uploadResult.Format,
                Width = uploadResult.Width,
                Height = uploadResult.Height,
                Bytes = uploadResult.Bytes,
                CreatedAt = uploadResult.CreatedAt
            };
        }

        public async Task<List<CloudinaryUploadResultDto>> UploadImagesAsync(List<IFormFile> files, string? folder = null)
        {
            if (files == null || files.Count == 0)
            {
                throw new ArgumentException("Danh sách file tải lên rỗng.");
            }

            var results = new List<CloudinaryUploadResultDto>();
            foreach (var file in files)
            {
                if (file != null && file.Length > 0)
                {
                    var result = await UploadImageAsync(file, folder);
                    results.Add(result);
                }
            }

            return results;
        }

        public async Task<CloudinaryDeleteResultDto> DeleteImageAsync(string publicId)
        {
            if (string.IsNullOrWhiteSpace(publicId))
            {
                throw new ArgumentException("PublicId không được để trống.");
            }

            var deletionParams = new DeletionParams(publicId.Trim());
            var result = await _cloudinary.DestroyAsync(deletionParams);

            return new CloudinaryDeleteResultDto
            {
                Result = result.Result,
                Success = string.Equals(result.Result, "ok", StringComparison.OrdinalIgnoreCase)
            };
        }
    }
}