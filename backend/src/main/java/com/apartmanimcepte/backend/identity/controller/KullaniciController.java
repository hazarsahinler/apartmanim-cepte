package com.apartmanimcepte.backend.identity.controller;

import com.apartmanimcepte.backend.identity.bus.kullaniciBus.KullaniciService;
import com.apartmanimcepte.backend.identity.dto.KullaniciKayitDTO;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import net.sf.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Date;

@RestController
@RequestMapping("/identity/yonetici")
public class KullaniciController {
    private final KullaniciService kullaniciService;

    public KullaniciController(KullaniciService kullaniciService) {
        this.kullaniciService = kullaniciService;
    }


    @PostMapping("/kayit")
    public ResponseEntity<String> yoneticiKayit(@Valid @RequestBody KullaniciKayitDTO kullaniciKayitDTO) throws IOException {
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO=kullaniciService.kullaniciKayit(kullaniciKayitDTO);
        return new ResponseEntity<>(responseDTO.getMessage(),HttpStatus.CREATED);

    }
}
