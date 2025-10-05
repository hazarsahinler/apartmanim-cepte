package com.apartmanimcepte.backend.structure.controller;

import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import com.apartmanimcepte.backend.structure.bus.SiteService;
import com.apartmanimcepte.backend.structure.dto.RequestDTO.SiteKayitDTO;
import com.apartmanimcepte.backend.structure.dto.ResponseDTO.SiteResponseDTO;
import com.apartmanimcepte.backend.structure.entity.Site;
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
    @GetMapping("/structure/site/{kullaniciId}")
    public List<SiteResponseDTO> kullaniciSiteleri(@PathVariable("kullaniciId")  Long kullaniciId) throws IOException {
        List<SiteResponseDTO> siteResponseDTO = siteService.sitelerim(kullaniciId);
        return siteResponseDTO;
    }

    @PostMapping("/structure/site/ekle")
    public ResponseDTO siteEkle(@RequestBody SiteKayitDTO  siteKayitDTO) throws Exception{
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO = siteService.SiteKayit(siteKayitDTO);
        return responseDTO;
    }
}
