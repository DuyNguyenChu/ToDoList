using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.DTOs.UserDto;
using BE.Mappers;
using BE.repositories.UserRepo;

namespace BE.Services.UserService
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repository;
        public UserService(IUserRepository repository)
        {
            _repository = repository;
        }
        public async Task<IEnumerable<UserViewDto>> GetAllAsync()
        {
            var entity = await _repository.GetAllAsync();
            return entity.Select(i => i.ViewEntityToDto());
        }
        public async Task<UserViewDto?> GetByIdAsync(Guid id)
        {
            await _repository.DowngradeExpiredRolesAsync();
            var entity = await _repository.GetByIdAsync(id);
            return entity?.ViewEntityToDto();
        }
        public async Task<UserViewDto> CreateAsync(UserCreateDto dto)
        {
            var trimmedEmail = string.IsNullOrWhiteSpace(dto.UserEmail) ? null : dto.UserEmail.Trim();
            var trimmedPhone = string.IsNullOrWhiteSpace(dto.UserPhone) ? null : dto.UserPhone.Trim();

            if (!string.IsNullOrWhiteSpace(trimmedEmail))
            {
                if (await _repository.ExistsByEmailAsync(trimmedEmail))
                {
                    throw new InvalidOperationException("Email này đã được sử dụng bởi một tài khoản khác.");
                }
            }

            if (!string.IsNullOrWhiteSpace(trimmedPhone))
            {
                if (await _repository.ExistsByPhoneAsync(trimmedPhone))
                {
                    throw new InvalidOperationException("Số điện thoại này đã được sử dụng bởi một tài khoản khác.");
                }
            }

            var entity = dto.CreateDtoToEntity();
            entity.UserEmail = trimmedEmail;
            entity.UserPhone = trimmedPhone;
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
            return entity.ViewEntityToDto();
        }
        public async Task<bool> UpdateAsync(Guid id, UserUpdateInformationDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;
            existing.UpdateDtoToEntity_Information(dto);
            _repository.Update(existing);
            await _repository.SaveChangesAsync();
            return true;
        }
        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;
            _repository.Remove(existing);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<(bool Success, string Message)> ChangePasswordAsync(Guid id, ChangePasswordDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
            {
                return (false, "Không tìm thấy người dùng.");
            }

            if (string.IsNullOrWhiteSpace(dto.OldPassword))
            {
                return (false, "Vui lòng nhập mật khẩu cũ.");
            }

            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
            {
                return (false, "Mật khẩu mới phải có ít nhất 6 ký tự.");
            }

            if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, existing.UserPassword))
            {
                return (false, "Mật khẩu cũ không chính xác.");
            }

            existing.UserPassword = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            _repository.Update(existing);
            await _repository.SaveChangesAsync();
            return (true, "Đổi mật khẩu thành công.");
        }

        public async Task<(bool Success, string Message)> UpdateContactAsync(Guid id, UserUpdateContactDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
            {
                return (false, "Không tìm thấy người dùng.");
            }

            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
            {
                return (false, "Vui lòng nhập mật khẩu hiện tại để xác nhận.");
            }

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, existing.UserPassword))
            {
                return (false, "Mật khẩu hiện tại không chính xác.");
            }

            if (!string.IsNullOrWhiteSpace(dto.UserEmail))
            {
                var trimmedEmail = dto.UserEmail.Trim();
                if (!string.Equals(trimmedEmail, existing.UserEmail, StringComparison.OrdinalIgnoreCase))
                {
                    if (await _repository.ExistsByEmailAsync(trimmedEmail, id))
                    {
                        return (false, "Email này đã được sử dụng bởi một tài khoản khác.");
                    }
                    existing.UserEmail = trimmedEmail;
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.UserPhone))
            {
                var trimmedPhone = dto.UserPhone.Trim();
                if (!string.Equals(trimmedPhone, existing.UserPhone, StringComparison.OrdinalIgnoreCase))
                {
                    if (await _repository.ExistsByPhoneAsync(trimmedPhone, id))
                    {
                        return (false, "Số điện thoại này đã được sử dụng bởi một tài khoản khác.");
                    }
                    existing.UserPhone = trimmedPhone;
                }
            }

            _repository.Update(existing);
            await _repository.SaveChangesAsync();
            return (true, "Cập nhật thông tin liên hệ thành công.");
        }

        public async Task<bool> UpdateRoleAsync(Guid id, UserUpdateRoleDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;
            existing.UpdateDtoToEntity_Role(dto);
            _repository.Update(existing);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}