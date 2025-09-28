package com.apartmanimcepte.backend.identity.bus.kullaniciBul;

import com.apartmanimcepte.backend.identity.entity.Kullanici;

public interface userDetailsService {
    Kullanici loadUserByUsername(String telefonNo);

}
