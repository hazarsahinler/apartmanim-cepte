package com.apartmanimcepte.backend.identity.bus.kullaniciBus;


import com.apartmanimcepte.backend.identity.dto.*;
import com.apartmanimcepte.backend.identity.entity.Kullanici;
import com.fasterxml.jackson.databind.util.JSONPObject;
import net.sf.json.JSONObject;

public interface KullaniciService {
    ResponseDTO YöneticiKayit(KullaniciKayitDTO kullaniciKayitDTO);

   ResponseDTO ApartmanSakinKayit(ApartmanSakinKayitDTO apartmanSakinKayitDTO);


    ResponseDTO KullaniciGiris(KullaniciGirisBilgiDTO  kullaniciGirisBilgiDTO);

    KullaniciResponseDTO KullaniciBilgi(Long kullaniciId);



}
