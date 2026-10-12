using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.DTOs.ToDoListDto;
using BE.DTOs.Common;

namespace BE.Services.ToDoListService
{
    public interface IToDoListService
    {
        Task<IEnumerable<ToDoListViewDto>> GetAllAsync(double? userLat = null, double? userLng = null);
        Task<ToDoListSummaryDto> GetSummaryAsync(double? userLat = null, double? userLng = null);
        Task<ToDoListViewDto?> GetByIdAsync(Guid id);
        Task<PagedResult<ToDoListViewDto>> SearchAsync(string? keyword, int pageNumber, int pageSize, double? userLat = null, double? userLng = null);
        Task<ToDoListViewDto> CreateAsync(ToDoListCreateDto dto);
        Task<bool> UpdateAsync(Guid id, ToDoListUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}