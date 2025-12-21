package com.apartmanimcepte.backend.announcement.entity;

import com.apartmanimcepte.backend.announcement.Enum.OnemSeviyesiEnum;
import com.apartmanimcepte.backend.identity.entity.Kullanici;
import com.apartmanimcepte.backend.structure.entity.Site;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "duyurular")
public class Duyuru {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "duyuru_id")
    private Long duyuruId;

    @Column(name = "duyuru_baslik", columnDefinition = "TEXT", nullable = false)
    private String duyuruBaslik;

    @Column(name = "duyuru_mesaji", columnDefinition = "TEXT", nullable = false)
    private String duyuruMesaji;

    @Column(name = "olusturulma_tarihi", nullable = false)
    private LocalDateTime olusturulmaTarihi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @Enumerated(EnumType.STRING)
    @Column(name = "onem_seviyesi", nullable = false)
    private OnemSeviyesiEnum onemSeviyesi;


}