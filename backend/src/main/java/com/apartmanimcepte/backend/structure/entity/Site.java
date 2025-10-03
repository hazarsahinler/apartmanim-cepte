package com.apartmanimcepte.backend.structure.entity;

import com.apartmanimcepte.backend.identity.entity.Kullanici;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Siteler")
public class Site {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "site_id")
    private long siteId;

    @Column(name = "site_ismi")
    private String siteIsmi;

    @Column(name = "site_il")
    private String siteIl;

    @Column(name = "site_ilce")
    private String siteIlce;

    @Column(name = "site_mahalle")
    private String siteMahalle;

    @Column(name = "site_sokak")
    private String siteSokak;

    @ManyToOne
    @JoinColumn(name="yonetici_id")
    private Kullanici kullanici;

}
