package com.apartmanimcepte.backend.structure.bus;


import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import com.apartmanimcepte.backend.identity.entity.Kullanici;
import com.apartmanimcepte.backend.structure.dto.RequestDTO.BlokKayitDTO;
import com.apartmanimcepte.backend.structure.dto.RequestDTO.SiteKayitDTO;
import com.apartmanimcepte.backend.structure.dto.ResponseDTO.BlokResponseDTO;
import com.apartmanimcepte.backend.structure.dto.ResponseDTO.DaireResponseDTO;
import com.apartmanimcepte.backend.structure.dto.ResponseDTO.SiteResponseDTO;
import com.apartmanimcepte.backend.structure.entity.Daire;

import java.util.List;

public interface SiteService {
    ResponseDTO SiteKayit(SiteKayitDTO siteKayitDTO);

    List<SiteResponseDTO> sitelerim(Long kullaniciId);

    ResponseDTO BlokKayit(BlokKayitDTO blokKayitDTO);

    List<BlokResponseDTO> getBloklar(Long siteId);

    List<DaireResponseDTO> getDaireler(Long blokId);

    DaireResponseDTO getDaireById(Long daireId);

    ResponseDTO daireSakinEkle(Kullanici kullanici, Daire daire);


}
