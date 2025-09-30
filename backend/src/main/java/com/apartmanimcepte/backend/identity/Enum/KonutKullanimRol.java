package com.apartmanimcepte.backend.identity.Enum;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.List;

public enum KonutKullanimRol {
    EvSahibi(1, "ROLE_EVSAHIBI"),
    Kiracı(2, "ROLE_KIRACI");
    private int role;
    private String authority;

    private KonutKullanimRol(int role, String authority) {
        this.role = role;
        this.authority = authority;
    }

    public int getRole() {
        return role;
    }

    public List<SimpleGrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority(authority));
    }

    public static KonutKullanimRol fromRole(int role) {
        for (KonutKullanimRol role1 : values()) {
            if (role1.getRole() == role) {
                return role1;
            }
        }
        throw new IllegalArgumentException("Unknown enum type " + role);
    }
}
