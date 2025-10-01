package com.apartmanimcepte.backend.identity.Enum;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.List;

public enum ApartmanRol {
    Yonetici(0,"ROLE_YONETICI"),
    ApartmanSakin(1,"ROLE_APARTMANSAKIN");
    private int role;
    private String authority;

    private ApartmanRol(int role, String authority) {
        this.role = role;
        this.authority = authority;
    }

    public int getRole() {
        return role;
    }

    public List<SimpleGrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority(authority));
    }
    public String getAuthority() {
        return authority;
    }

    public static ApartmanRol fromRole(int role) {
        for (ApartmanRol role1 : values()) {
            if (role1.getRole() == role) {
                return role1;
            }
        }
        throw new IllegalArgumentException("Unknown enum type " + role);
    }
}
