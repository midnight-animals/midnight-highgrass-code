using AutoMapper;
using online_dictionary.DTOs;
using online_dictionary.Models;

namespace online_dictionary.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile() {
            CreateMap<RegisterRequest, User>();
            CreateMap<User, UserDto>();
        }
    }
}
