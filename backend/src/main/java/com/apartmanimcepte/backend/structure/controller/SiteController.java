package com.apartmanimcepte.backend.structure.controller;

import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import com.apartmanimcepte.backend.structure.bus.SiteService;
import com.apartmanimcepte.backend.structure.dto.RequestDTO.BlokKayitDTO;
import com.apartmanimcepte.backend.structure.dto.RequestDTO.DaireyeSakinEkleDTO;
import com.apartmanimcepte.backend.structure.dto.RequestDTO.SiteKayitDTO;
import com.apartmanimcepte.backend.structure.dto.ResponseDTO.BlokResponseDTO;
import com.apartmanimcepte.backend.structure.dto.ResponseDTO.DaireResponseDTO;
import com.apartmanimcepte.backend.structure.dto.ResponseDTO.SiteResponseDTO;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class SiteController {
    private final SiteService siteService;

    public SiteController(SiteService siteService) {
        this.siteService = siteService;
    }

    //test edildi
    @GetMapping("/structure/site/{kullaniciId}")
    public List<SiteResponseDTO> kullaniciSiteleri(@PathVariable("kullaniciId") Long kullaniciId) throws IOException {
        List<SiteResponseDTO> siteResponseDTO = siteService.sitelerim(kullaniciId);
        return siteResponseDTO;
    }

    //test edildi
    @PostMapping("/structure/site/ekle")
    public ResponseDTO siteEkle(@RequestBody SiteKayitDTO siteKayitDTO) throws Exception {
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO = siteService.SiteKayit(siteKayitDTO);
        return responseDTO;
    }

    //test edildi
    @PostMapping("/structure/blok/ekle")
    public ResponseDTO blokEkle(@RequestBody BlokKayitDTO blokKayitDTO) throws Exception {
        ResponseDTO responseDTO = siteService.BlokKayit(blokKayitDTO);
        return responseDTO;
    }

    //test edildi
    @GetMapping("/structure/bloklar/{siteId}")
    public List<BlokResponseDTO> getBloklar(@PathVariable("siteId") Long siteId) throws IOException {
        return siteService.getBloklar(siteId);
    }

    //test edildi
    @GetMapping("/structure/daireler/{blokId}")
    public List<DaireResponseDTO> getDaireler(@PathVariable("blokId") Long blokId) throws IOException {
        return siteService.getDaireler(blokId);
    }

    //test edildi
    @GetMapping("/structure/daire/{daireId}")
    public DaireResponseDTO getDaireById(@PathVariable("daireId") Long daireId) throws IOException {
        return siteService.getDaireById(daireId);
    }
    //test edildi
    @PostMapping("/structure/daire/sakin/ekle")
    public ResponseDTO sakinEkle(@RequestBody DaireyeSakinEkleDTO daireyeSakinEkleDTO) throws Exception {
        ResponseDTO responseDTO = siteService.daireSakinEkle(daireyeSakinEkleDTO);
        return responseDTO;
    }

}
