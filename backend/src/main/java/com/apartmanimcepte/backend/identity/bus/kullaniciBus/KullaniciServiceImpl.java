package com.apartmanimcepte.backend.identity.bus.kullaniciBus;

import com.apartmanimcepte.backend.identity.Enum.ApartmanRol;
import com.apartmanimcepte.backend.identity.Enum.KonutKullanimRol;
import com.apartmanimcepte.backend.identity.bus.jwt.JwtService;
import com.apartmanimcepte.backend.identity.bus.kullaniciBul.MyUserDetailsService;
import com.apartmanimcepte.backend.identity.dao.KullaniciDAO;
import com.apartmanimcepte.backend.identity.dto.KullaniciGirisBilgiDTO;
import com.apartmanimcepte.backend.identity.dto.KullaniciKayitDTO;
import com.apartmanimcepte.backend.identity.dto.KullaniciResponseDTO;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import com.apartmanimcepte.backend.identity.entity.Kullanici;
import net.sf.json.JSONObject;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KullaniciServiceImpl implements KullaniciService {

    private final KullaniciDAO kullaniciDAO;
    private final PasswordEncoder passwordEncoder;
    private final MyUserDetailsService userDetailsService;
    private final JwtService jwtService;

    public KullaniciServiceImpl(KullaniciDAO kullaniciDAO, PasswordEncoder passwordEncoder, MyUserDetailsService userDetailsService, JwtService jwtService) {
        this.kullaniciDAO = kullaniciDAO;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    /**
     * Kullanıcı kayıt dtosunda tutulan bilgileri kullanıcıya atayıp YÖNETİCİ kaydı gerçekleştiriliyor.
     *
     * @param kullaniciKayitDTO
     * @return
     */


    @Override
    public ResponseDTO YöneticiKayit(KullaniciKayitDTO kullaniciKayitDTO) {
        List<Kullanici> kullaniciList = kullaniciDAO.getObjectsByParam(Kullanici.class, "kullaniciTelefon", kullaniciKayitDTO.getKullaniciTelefon());
        Kullanici kullanici = new Kullanici();
        ResponseDTO responseDTO = new ResponseDTO();
        if (kullaniciList.isEmpty()) {
            kullanici.setKullaniciAdi(kullaniciKayitDTO.getKullaniciAdi());
            kullanici.setKullaniciSoyadi(kullaniciKayitDTO.getKullaniciSoyadi());
            kullanici.setKullaniciEposta(kullaniciKayitDTO.getKullaniciEposta());
            kullanici.setKullaniciSifre(passwordEncoder.encode(kullaniciKayitDTO.getKullaniciSifre()));
            kullanici.setKullaniciTelefon(kullaniciKayitDTO.getKullaniciTelefon());
            kullanici.setApartmanRol(ApartmanRol.Yonetici);
            kullanici.setKonutKullanimRol(KonutKullanimRol.fromRole(kullaniciKayitDTO.getKonutKullanim()));
            kullaniciDAO.saveOrUpdate(kullanici);
            responseDTO.setMessage("Kullanıcı başarıyla kaydedildi");
        } else {
            responseDTO.setMessage("Kullanıcı sisteme kayıtlı!");
        }
        return responseDTO;

    }

    /**
     * Kullanıcıların giris kontrolleri.
     *
     * @param kullaniciGirisBilgiDTO
     * @return
     */

    @Override
    public ResponseDTO KullaniciGiris(KullaniciGirisBilgiDTO kullaniciGirisBilgiDTO) {
        Kullanici kullanici = new Kullanici();
        ResponseDTO responseDTO = new ResponseDTO();
        List<Kullanici> kullaniciList = kullaniciDAO.getObjectsByParam(Kullanici.class, "kullaniciTelefon", kullaniciGirisBilgiDTO.getKullaniciTelefon());

        if (kullaniciList == null || kullaniciList.isEmpty()) {
            responseDTO.setMessage("Kullanici Telefon Numarası Hatalı!!");
            return responseDTO;
        } else {
            kullanici=kullaniciList.get(0);
            if (!passwordEncoder.matches(kullaniciGirisBilgiDTO.getKullaniciSifre(), kullanici.getKullaniciSifre())) {
                responseDTO.setMessage("Şifre Hatalı!");
                return responseDTO;
            }
            String token = jwtService.generateToken(kullanici.getKullaniciTelefon());
            responseDTO.setMessage("Giriş başarılı.");
            responseDTO.setToken(token);
        }
        return responseDTO;
    }

    /**
     * Kullanıcı Id parametresi ile kullanıcı bilgileri çekiliyor.
     * Kullanıcı bilgileri kısmında gösterilecek bilgiler için kullanılacak.
     *
     * @param kullaniciId
     * @return
     */

    @Override
    public KullaniciResponseDTO KullaniciBilgi(Long kullaniciId) {
        Kullanici kullanici = new Kullanici();
        List<Kullanici> kullaniciList = kullaniciDAO.getObjectsByParam(Kullanici.class, "kullaniciId", kullaniciId);
        kullanici = kullaniciList.get(0);
        KullaniciResponseDTO responseDTO = new KullaniciResponseDTO();
        responseDTO.setKullaniciAdi(kullanici.getKullaniciAdi());
        responseDTO.setKullaniciSoyadi(kullanici.getKullaniciSoyadi());
        responseDTO.setKullaniciTelefon(kullanici.getKullaniciTelefon());
        responseDTO.setKullaniciEposta(kullanici.getKullaniciEposta());
        responseDTO.setApartmanRol(kullanici.getApartmanRol().name());
        responseDTO.setKonutKullanim(kullanici.getKonutKullanimRol().name());
        return responseDTO;
    }
}
