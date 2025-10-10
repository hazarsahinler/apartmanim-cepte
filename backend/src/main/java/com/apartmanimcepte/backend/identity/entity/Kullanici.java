package com.apartmanimcepte.backend.identity.entity;

import com.apartmanimcepte.backend.identity.Enum.ApartmanRol;
import com.apartmanimcepte.backend.identity.Enum.KonutKullanimRol;
import com.apartmanimcepte.backend.structure.entity.Daire;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;


@Entity
@Data
@Table(name = "kullanici")
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
    @Column(columnDefinition = "smallint")
    private ApartmanRol apartmanRol;

    @Enumerated(EnumType.ORDINAL)
    @Column(columnDefinition = "smallint")
    private KonutKullanimRol konutKullanimRol;

    @ManyToMany(mappedBy = "kullanicilar")
    @JsonBackReference
    @ToString.Exclude // BU SATIRI EKLEYİN
    @EqualsAndHashCode.Exclude // Döngüsel bağımlılığı kırmak için bunu da eklemek iyi bir pratiktir.
    private Set<Daire> daireler = new HashSet<>();
}