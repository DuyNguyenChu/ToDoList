using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.DTOs.ToDoListDto
{
    public class ToDoListUpdateDto
    {
        public Guid ToDoListId { get; set; }
        public Guid StoresItemsItemInformationId { get; set; }
        public string? ToDoListDecription { get; set; }
        public bool IsDone { get; set; }
    }
}