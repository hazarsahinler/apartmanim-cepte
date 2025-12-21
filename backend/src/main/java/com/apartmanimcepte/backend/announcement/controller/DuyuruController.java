package com.apartmanimcepte.backend.announcement.controller;

import com.apartmanimcepte.backend.announcement.Enum.OnemSeviyesiEnum;
import com.apartmanimcepte.backend.announcement.bus.DuyuruService;
import com.apartmanimcepte.backend.announcement.dto.request.DuyuruCreateRequestDTO;
import com.apartmanimcepte.backend.announcement.dto.response.DuyuruResponseDTO;
import com.apartmanimcepte.backend.finance.dto.Request.BorcTanimiCreateRequestDTO;
import com.apartmanimcepte.backend.finance.dto.Request.TanimlanmisBorcFiltreDTO;
import com.apartmanimcepte.backend.finance.dto.Response.BorcTanimiResponseDTO;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DuyuruController {
    private final DuyuruService duyuruService;

    public DuyuruController(DuyuruService duyuruService) {
        this.duyuruService = duyuruService;
    }

    @PostMapping("/duyuru/ekle")
    public ResponseDTO duyuruEkle(@RequestBody DuyuruCreateRequestDTO duyuruCreateRequestDTO) {
        return duyuruService.duyuruEkle(duyuruCreateRequestDTO);
    }

    @GetMapping("/duyuru/duyurular")
    public List<DuyuruResponseDTO> duyuruResponseDTOS(
            @RequestParam(required = false) Long siteId,
            @RequestParam(required = false) OnemSeviyesiEnum onemSeviyesi) {
        return duyuruService.eklenenDuyurular(siteId, onemSeviyesi);
    }

}
