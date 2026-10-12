using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.DTOs.ToDoListDto
{
    public class ToDoListCreateDto
    {
        public Guid UserId { get; set; }
        public Guid StoresItemsItemInformationId { get; set; }
        public string? ToDoListDecription { get; set; }
    }
}