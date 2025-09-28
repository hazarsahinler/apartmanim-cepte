package com.apartmanimcepte.backend.identity.entity;

import com.apartmanimcepte.backend.identity.Enum.ApartmanRol;
import com.apartmanimcepte.backend.identity.Enum.KonutKullanimRol;
import jakarta.persistence.*;
import lombok.Data;


@Entity
@Data
@Table(name = "kullanici", schema = "identity")
public class Kullanici {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kullanici_id")
    private long kullaniciId;

    @Column(name = "kullanici_adi")
    private String kullaniciAdi;

    @Column(name = "kullanici_soyadi")
    private String kullaniciSoyadi;

    @Column(name = "kullanici_ePosta")
    private String kullaniciEposta;

    @Column(name = "kullanici_telefon")
    private String kullaniciTelefon;

    @Column(name = "kullanici_sifre")
    private String kullaniciSifre;

    @Enumerated(EnumType.ORDINAL)
    private ApartmanRol apartmanRol;

    @Enumerated(EnumType.ORDINAL)
    private KonutKullanimRol konutKullanimRol;

}
