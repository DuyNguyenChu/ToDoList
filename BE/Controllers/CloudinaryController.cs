using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using BE.Services.CloudinaryService;
using BE.DTOs.CloudinaryDto;

namespace BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CloudinaryController : ControllerBase
    {
        private readonly ICloudinaryService _cloudinaryService;

        public CloudinaryController(ICloudinaryService cloudinaryService)
        {
            _cloudinaryService = cloudinaryService;
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage([FromForm] UploadImageDto dto)
        {
            if (dto?.File == null || dto.File.Length == 0)
            {
                return BadRequest(new { message = "Vui lòng chọn file hình ảnh hợp lệ." });
            }

            try
            {
                var result = await _cloudinaryService.UploadImageAsync(dto.File, dto.Folder);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpPost("upload-multiple")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImages([FromForm] UploadMultipleImagesDto dto)
        {
            if (dto?.Files == null || dto.Files.Count == 0)
            {
                return BadRequest(new { message = "Vui lòng chọn ít nhất một file hình ảnh." });
            }

            try
            {
                var results = await _cloudinaryService.UploadImagesAsync(dto.Files, dto.Folder);
                return Ok(results);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteImage([FromQuery] string publicId)
        {
            if (string.IsNullOrWhiteSpace(publicId))
            {
                return BadRequest(new { message = "PublicId không được để trống." });
            }

            try
            {
                var result = await _cloudinaryService.DeleteImageAsync(publicId);
                if (!result.Success)
                {
                    return BadRequest(new { message = "Xóa hình ảnh trên Cloudinary thất bại.", details = result });
                }

                return Ok(new { message = "Xóa hình ảnh thành công.", details = result });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}
