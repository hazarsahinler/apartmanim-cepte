package com.apartmanimcepte.backend.structure.entity;

import com.apartmanimcepte.backend.identity.entity.Kullanici;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Data
@Table(name = "daireler") // Standart: küçük harf ve çoğul
public class Daire {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long daireId;

    @Column(name = "daire_no")
    private int daireNo;

    @Column(name = "kat_no")
    private int katNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blok_id", nullable = false)
    private Blok blok;

    @ManyToMany(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
            name = "daire_sakinleri",
            joinColumns = @JoinColumn(name = "daire_id"),
            inverseJoinColumns = @JoinColumn(name = "kullanici_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Kullanici> kullanicilar = new HashSet<>();
}