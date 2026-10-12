using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using BE.Services.ItemInformationService;
using BE.DTOs.ItemInformationDto;
using BE.Hubs;

namespace BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemInformationController : ControllerBase
    {
        private readonly IItemInformationService _service;
        private readonly IHubContext<AppHub> _hubContext;

        public ItemInformationController(IItemInformationService service, IHubContext<AppHub> hubContext)
        {
            _service = service;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var entity = await _service.GetAllAsync();
            return Ok(entity);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var entity = await _service.GetByIdAsync(id);
            if (entity == null) return NotFound();
            return Ok(entity);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string? keyword, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 100)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;
            var result = await _service.SearchAsync(keyword, pageNumber, pageSize);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ItemInformationCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _service.CreateAsync(dto);

            await _hubContext.Clients.All.SendAsync("ReceiveItemInformationCreated", result);
            await _hubContext.Clients.All.SendAsync("ReceiveCrudNotification", new { entity = "ItemInformation", action = "CREATE", data = result });

            return CreatedAtAction(nameof(GetById), new { id = result.ItemInformationId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ItemInformationUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var success = await _service.UpdateAsync(id, dto);
            if (!success) return NotFound();

            var updated = await _service.GetByIdAsync(id);
            if (updated != null)
            {
                await _hubContext.Clients.All.SendAsync("ReceiveItemInformationUpdated", updated);
                await _hubContext.Clients.All.SendAsync("ReceiveCrudNotification", new { entity = "ItemInformation", action = "UPDATE", data = updated });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success) return NotFound();

            await _hubContext.Clients.All.SendAsync("ReceiveItemInformationDeleted", id);
            await _hubContext.Clients.All.SendAsync("ReceiveCrudNotification", new { entity = "ItemInformation", action = "DELETE", data = new { id } });

            return NoContent();
        }
    }
}
