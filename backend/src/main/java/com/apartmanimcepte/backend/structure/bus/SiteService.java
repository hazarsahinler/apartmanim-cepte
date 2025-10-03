package com.apartmanimcepte.backend.structure.bus;


import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import com.apartmanimcepte.backend.structure.dto.RequestDTO.SiteKayitDTO;
import com.apartmanimcepte.backend.structure.dto.ResponseDTO.SiteResponseDTO;

import java.util.List;

public interface SiteService {
    ResponseDTO SiteKayit(SiteKayitDTO siteKayitDTO);

    List<SiteResponseDTO> sitelerim(Long kullaniciId);

}
