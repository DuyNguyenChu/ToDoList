using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using BE.Services.StoresItemsItemInformationService;
using BE.DTOs.StoresItemsItemInformationDto;
using BE.Hubs;

namespace BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StoresItemsItemInformationController : ControllerBase
    {
        private readonly IStoresItemsItemInformationService _service;
        private readonly IHubContext<AppHub> _hubContext;

        public StoresItemsItemInformationController(IStoresItemsItemInformationService service, IHubContext<AppHub> hubContext)
        {
            _service = service;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] double? userLat, [FromQuery] double? userLng)
        {
            var entity = await _service.GetAllAsync(userLat, userLng);
            return Ok(entity);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var entity = await _service.GetByIdAsync(id);
            if (entity == null) return NotFound();
            return Ok(entity);
        }

        [HttpGet("store/{storeId}")]
        public async Task<IActionResult> GetByStoreId(Guid storeId, [FromQuery] string? keyword = null)
        {
            var entities = await _service.GetByStoreIdAsync(storeId, keyword);
            return Ok(entities);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string? keyword, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] double? userLat = null, [FromQuery] double? userLng = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;
            var result = await _service.SearchAsync(keyword, pageNumber, pageSize, userLat, userLng);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] StoresItemsItemInformationCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _service.CreateAsync(dto);

            await _hubContext.Clients.All.SendAsync("ReceiveStoresItemsItemInformationCreated", result);
            await _hubContext.Clients.All.SendAsync("ReceiveCrudNotification", new { entity = "StoresItemsItemInformation", action = "CREATE", data = result });

            return CreatedAtAction(nameof(GetById), new { id = result.StoresItemsItemInformationId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] StoresItemsItemInformationUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var success = await _service.UpdateAsync(id, dto);
            if (!success) return NotFound();

            var updated = await _service.GetByIdAsync(id);
            if (updated != null)
            {
                await _hubContext.Clients.All.SendAsync("ReceiveStoresItemsItemInformationUpdated", updated);
                await _hubContext.Clients.All.SendAsync("ReceiveCrudNotification", new { entity = "StoresItemsItemInformation", action = "UPDATE", data = updated });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success) return NotFound();

            await _hubContext.Clients.All.SendAsync("ReceiveStoresItemsItemInformationDeleted", id);
            await _hubContext.Clients.All.SendAsync("ReceiveCrudNotification", new { entity = "StoresItemsItemInformation", action = "DELETE", data = new { id } });

            return NoContent();
        }
    }
}
