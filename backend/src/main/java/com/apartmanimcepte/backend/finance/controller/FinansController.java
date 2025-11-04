package com.apartmanimcepte.backend.finance.controller;

import com.apartmanimcepte.backend.finance.bus.FinansService;
import com.apartmanimcepte.backend.finance.dto.Request.BorcTanimiCreateRequestDTO;
import com.apartmanimcepte.backend.finance.dto.Request.TanimlanmisBorcFiltreDTO;
import com.apartmanimcepte.backend.finance.dto.Response.BorcTanimiResponseDTO;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FinansController {

    private final FinansService finansService;

    public FinansController(FinansService finansService) {
        this.finansService = finansService;
    }

    @PostMapping("/finance/borc/ekle")
    public ResponseDTO borcEkle(@RequestBody BorcTanimiCreateRequestDTO borcTanimiCreateRequestDto) {

        return finansService.borcTanim(borcTanimiCreateRequestDto);

    }

    @GetMapping("/finance/eklenen/borclar")
    public List<BorcTanimiResponseDTO> eklenenBorclar(TanimlanmisBorcFiltreDTO tanimlanmisBorcFiltreDTO) {

        return finansService.tanimlananBorclar(tanimlanmisBorcFiltreDTO);

    }
}
