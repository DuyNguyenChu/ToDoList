using System.Collections.Generic;

namespace BE.DTOs.ToDoListDto
{
    public class ToDoListSummaryDto
    {
        public IEnumerable<ToDoListViewDto> Items { get; set; } = new List<ToDoListViewDto>();
        public decimal TotalPrice { get; set; }
        public int TotalItems { get; set; }
        public int DoneItems { get; set; }
        public int PendingItems => TotalItems - DoneItems;
    }
}
