package com.apartmanimcepte.backend.finance.controller;

import com.apartmanimcepte.backend.finance.bus.FinansService;
import com.apartmanimcepte.backend.finance.dto.BorcTanimiCreateRequestDto;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class FinansController {

    private final FinansService finansService;
    public FinansController(FinansService finansService) {
        this.finansService = finansService;
    }
    @PostMapping("/borc/ekle")
    public ResponseDTO borcEkle(@RequestBody BorcTanimiCreateRequestDto borcTanimiCreateRequestDto){
        return finansService.borcTanim(borcTanimiCreateRequestDto);
    }
}
