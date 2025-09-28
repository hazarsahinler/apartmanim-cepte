package com.apartmanimcepte.backend.identity.bus.kullaniciBus;


import com.apartmanimcepte.backend.identity.dto.KullaniciKayitDTO;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import com.apartmanimcepte.backend.identity.entity.Kullanici;
import com.fasterxml.jackson.databind.util.JSONPObject;
import net.sf.json.JSONObject;

public interface KullaniciService {
    ResponseDTO kullaniciKayit(KullaniciKayitDTO kullaniciKayitDTO);
}
