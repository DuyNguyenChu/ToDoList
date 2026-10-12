using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.Models;

namespace BE.repositories.ToDoListRepo
{
    public interface IToDoListRepository
    {
        Task<IEnumerable<ToDoList>> GetAllAsync();
        Task<ToDoList?> GetByIdAsync(Guid id);
        Task<(IEnumerable<ToDoList> Items, int TotalCount)> SearchAsync(string? keyword, int pageNumber, int pageSize);
        Task AddAsync(ToDoList entity);
        void Update(ToDoList entity);
        void Remove(ToDoList entity);
        Task SaveChangesAsync();
    }
}