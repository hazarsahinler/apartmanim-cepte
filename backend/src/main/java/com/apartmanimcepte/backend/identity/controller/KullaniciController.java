package com.apartmanimcepte.backend.identity.controller;

import com.apartmanimcepte.backend.identity.bus.kullaniciBul.userDetailsService;
import com.apartmanimcepte.backend.identity.bus.kullaniciBus.KullaniciService;
import com.apartmanimcepte.backend.identity.dao.KullaniciDAO;
import com.apartmanimcepte.backend.identity.dto.*;
import com.apartmanimcepte.backend.identity.entity.Kullanici;
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
import java.util.List;


@RestController
@RequestMapping("/api")
public class KullaniciController {
    private final KullaniciService kullaniciService;
    private final KullaniciDAO kullaniciDAO;
    private static final Logger logger = LoggerFactory.getLogger(KullaniciController.class);
    private final userDetailsService userDetailsService;


    public KullaniciController(KullaniciService kullaniciService, KullaniciDAO kullaniciDAO, userDetailsService userDetailsService) {
        this.kullaniciService = kullaniciService;
        this.kullaniciDAO = kullaniciDAO;
        this.userDetailsService = userDetailsService;
    }


    @PostMapping("/identity/yonetici/kayit")
    public ResponseEntity<String> yoneticiKayit(@Valid @RequestBody KullaniciKayitDTO kullaniciKayitDTO) throws IOException {
        try {
            ResponseDTO responseDTO = kullaniciService.YöneticiKayit(kullaniciKayitDTO);
            return new ResponseEntity<>(responseDTO.getMessage(), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Kayıt işlemi sırasında bir hata oluştu: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/identity/giris")
    public ResponseEntity<ResponseDTO> kullaniciGiris(@Valid @RequestBody KullaniciGirisBilgiDTO kullaniciGirisBilgiDTO) throws IOException {
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO= kullaniciService.KullaniciGiris(kullaniciGirisBilgiDTO);
        return new ResponseEntity<>(responseDTO,HttpStatus.OK);
    }
    @GetMapping("/identity/kullanici/bilgi/{kullaniciId}")
    public KullaniciResponseDTO kullaniciBilgileri(@PathVariable("kullaniciId") Long kullaniciId) throws IOException {
        KullaniciResponseDTO responseDTO = new KullaniciResponseDTO();
        responseDTO=kullaniciService.KullaniciBilgi(kullaniciId);
        return responseDTO;
    }
    @GetMapping("/identity/kullanici/telefon/{telefon}")
    public ResponseEntity<KullaniciResponseDTO> kullaniciTelefonKontrol(@PathVariable String telefon) {
        try {
           Kullanici kullanici = userDetailsService.loadUserByUsername(telefon);
            if (kullanici==null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND); // 404 = Kayıtlı değil
            }

            KullaniciResponseDTO responseDTO = new KullaniciResponseDTO();
            responseDTO.setKullaniciId(kullanici.getKullaniciId());
            responseDTO.setKullaniciAdi(kullanici.getKullaniciAdi());
            responseDTO.setKullaniciSoyadi(kullanici.getKullaniciSoyadi());
            responseDTO.setKonutKullanim(kullanici.getKonutKullanimRol().name());
            responseDTO.setKullaniciEposta(kullanici.getKullaniciEposta());
            responseDTO.setApartmanRol(kullanici.getApartmanRol().name());
            responseDTO.setKullaniciTelefon(kullanici.getKullaniciTelefon());

            return new ResponseEntity<>(responseDTO, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PostMapping("/identity/apartman/sakin/kayit")
    public ResponseEntity<String> apartmanSakinKayit(@Valid @RequestBody ApartmanSakinKayitDTO apartmanSakinKayitDTO) throws IOException {
        try {
            ResponseDTO responseDTO = kullaniciService.ApartmanSakinKayit(apartmanSakinKayitDTO);
            return new ResponseEntity<>(responseDTO.getMessage(), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Kayıt işlemi sırasında bir hata oluştu: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
