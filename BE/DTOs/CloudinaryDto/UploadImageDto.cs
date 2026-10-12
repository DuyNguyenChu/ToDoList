using Microsoft.AspNetCore.Http;

namespace BE.DTOs.CloudinaryDto
{
    public class UploadImageDto
    {
        public IFormFile File { get; set; } = null!;
        public string? Folder { get; set; }
    }

    public class UploadMultipleImagesDto
    {
        public System.Collections.Generic.List<IFormFile> Files { get; set; } = new();
        public string? Folder { get; set; }
    }
}
