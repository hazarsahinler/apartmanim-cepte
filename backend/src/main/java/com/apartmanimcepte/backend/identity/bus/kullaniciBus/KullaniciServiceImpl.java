package com.apartmanimcepte.backend.identity.bus.kullaniciBus;

import com.apartmanimcepte.backend.identity.Enum.ApartmanRol;
import com.apartmanimcepte.backend.identity.Enum.KonutKullanimRol;
import com.apartmanimcepte.backend.identity.dao.KullaniciDAO;
import com.apartmanimcepte.backend.identity.dto.KullaniciKayitDTO;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import com.apartmanimcepte.backend.identity.entity.Kullanici;
import net.sf.json.JSONObject;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KullaniciServiceImpl implements KullaniciService{

    private final KullaniciDAO kullaniciDAO;
    private final PasswordEncoder passwordEncoder;

    public KullaniciServiceImpl(KullaniciDAO kullaniciDAO, PasswordEncoder passwordEncoder) {
        this.kullaniciDAO = kullaniciDAO;
        this.passwordEncoder = passwordEncoder;
    }


    @Override
    public ResponseDTO kullaniciKayit(KullaniciKayitDTO kullaniciKayitDTO) {
        List<Kullanici> kullaniciList = kullaniciDAO.getObjectsByParam(Kullanici.class, "kullaniciTelefon", kullaniciKayitDTO.getKullaniciTelefon());
        Kullanici kullanici = new Kullanici();
        ResponseDTO responseDTO=new ResponseDTO();
        if(kullaniciList.isEmpty()){
            kullanici.setKullaniciAdi(kullaniciKayitDTO.getKullaniciAdi());
            kullanici.setKullaniciSoyadi(kullaniciKayitDTO.getKullaniciSoyadi());
            kullanici.setKullaniciEposta(kullaniciKayitDTO.getKullaniciEposta());
            kullanici.setKullaniciSifre(kullaniciKayitDTO.getKullaniciSifre());
            kullanici.setKullaniciTelefon(kullaniciKayitDTO.getKullaniciTelefon());
            kullanici.setApartmanRol(ApartmanRol.Yonetici);
            kullanici.setKonutKullanimRol(KonutKullanimRol.fromRole(kullaniciKayitDTO.getKonutKullanim()));
            kullaniciDAO.saveOrUpdate(kullanici);
            responseDTO.setMessage("Kullanıcı başarıyla kaydedildi");
        }else{
            responseDTO.setMessage("Kullanıcı sisteme kayıtlı!");
        }
        return responseDTO;

    }
}
