package com.apartmanimcepte.backend.identity.controller;

import com.apartmanimcepte.backend.identity.bus.kullaniciBus.KullaniciService;
import com.apartmanimcepte.backend.identity.dto.KullaniciGirisBilgiDTO;
import com.apartmanimcepte.backend.identity.dto.KullaniciKayitDTO;
import com.apartmanimcepte.backend.identity.dto.KullaniciResponseDTO;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import net.sf.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Date;


@RestController
@RequestMapping("/api/identity")
public class KullaniciController {
    private final KullaniciService kullaniciService;
    private static final Logger logger = LoggerFactory.getLogger(KullaniciController.class);


    public KullaniciController(KullaniciService kullaniciService) {
        this.kullaniciService = kullaniciService;
    }


    @PostMapping("/yonetici/kayit")
    public ResponseEntity<String> yoneticiKayit(@Valid @RequestBody KullaniciKayitDTO kullaniciKayitDTO) throws IOException {
        logger.info("Yönetici kayıt isteği alındı: {}", kullaniciKayitDTO.toString());
        try {
            ResponseDTO responseDTO = kullaniciService.YöneticiKayit(kullaniciKayitDTO);
            logger.info("Yönetici kaydı başarılı: {}", responseDTO.getMessage());
            return new ResponseEntity<>(responseDTO.getMessage(), HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Yönetici kaydı sırasında hata: ", e);
            return new ResponseEntity<>("Kayıt işlemi sırasında bir hata oluştu: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/giris")
    public ResponseEntity<String> kullaniciGiris(@Valid @RequestBody KullaniciGirisBilgiDTO kullaniciGirisBilgiDTO) throws IOException {
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO= kullaniciService.KullaniciGiris(kullaniciGirisBilgiDTO);
        return new ResponseEntity<>(responseDTO.getMessage(),HttpStatus.OK);
    }
    @GetMapping("/kullanici/bilgi")
    public KullaniciResponseDTO kullaniciBilgileri(@Valid @RequestBody long kullaniciId) throws IOException {
        KullaniciResponseDTO responseDTO = new KullaniciResponseDTO();
        responseDTO=kullaniciService.KullaniciBilgi(kullaniciId);
        return responseDTO;
    }
}
