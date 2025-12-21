package com.apartmanimcepte.backend.announcement.bus;

import com.apartmanimcepte.backend.announcement.Enum.OnemSeviyesiEnum;
import com.apartmanimcepte.backend.announcement.dto.request.DuyuruCreateRequestDTO;
import com.apartmanimcepte.backend.announcement.dto.response.DuyuruResponseDTO;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;

import java.util.List;

public interface DuyuruService {
    ResponseDTO duyuruEkle(DuyuruCreateRequestDTO duyuruCreateRequestDTO);
    List<DuyuruResponseDTO> eklenenDuyurular(Long siteId, OnemSeviyesiEnum onemSeviyesi);
}
