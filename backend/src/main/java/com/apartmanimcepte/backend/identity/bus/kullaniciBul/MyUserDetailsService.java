package com.apartmanimcepte.backend.identity.bus.kullaniciBul;

import com.apartmanimcepte.backend.identity.dao.KullaniciDAO;
import com.apartmanimcepte.backend.identity.entity.Kullanici;
import jakarta.transaction.Transactional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MyUserDetailsService implements userDetailsService {
    private final KullaniciDAO kullaniciDAO;

    public MyUserDetailsService(KullaniciDAO kullaniciDAO) {
        this.kullaniciDAO = kullaniciDAO;
    }


    @Override
    @Transactional
    public Kullanici loadUserByUsername(String telefonNo) throws UsernameNotFoundException {

            List<Kullanici> kullaniciList = kullaniciDAO.getObjectsByParam(Kullanici.class, "kullaniciTelefon", telefonNo);

            if (kullaniciList == null || kullaniciList.isEmpty()) {
                throw new UsernameNotFoundException("'" + telefonNo + "' telefon numarasına sahip kullanıcı bulunamadı.");
            }
            // Kullanici sınıfınız UserDetails'i implemente ettiği için direkt cast edebilir veya döndürebilirsiniz.
            return kullaniciList.get(0);
        }
    }


