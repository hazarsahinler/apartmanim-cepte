package com.apartmanimcepte.backend.finance.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
@Table(name = "BorcOdemeIstekler")
public class BorcOdemeIstekler {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "daire_borc_id")
    private DaireBorc daireBorc;

    private LocalDate istekTarihi;

    private LocalDate onayTarihi;

    @Column(name = "onaylandı_mı")
    private boolean onaylandiMi = false;


}
