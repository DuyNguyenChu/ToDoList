using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using BE.DTOs.CloudinaryDto;

namespace BE.Services.CloudinaryService
{
    public interface ICloudinaryService
    {
        Task<CloudinaryUploadResultDto> UploadImageAsync(IFormFile file, string? folder = null);
        Task<List<CloudinaryUploadResultDto>> UploadImagesAsync(List<IFormFile> files, string? folder = null);
        Task<CloudinaryDeleteResultDto> DeleteImageAsync(string publicId);
    }
}