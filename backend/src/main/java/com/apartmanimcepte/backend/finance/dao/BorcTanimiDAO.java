package com.apartmanimcepte.backend.finance.dao;

import com.apartmanimcepte.backend.finance.dto.Request.TanimlanmisBorcFiltreDTO;
import com.apartmanimcepte.backend.finance.dto.Response.BorcTanimiResponseDTO;
import com.apartmanimcepte.backend.identity.dao.BaseDAO;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public class BorcTanimiDAO extends BaseDAO {
    private final SessionFactory sessionFactory;

    public BorcTanimiDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }

    public List<BorcTanimiResponseDTO> getTanimlananBorclar(TanimlanmisBorcFiltreDTO filtreDTO) {
        StringBuilder hql = new StringBuilder();

        hql.append(" SELECT NEW com.apartmanimcepte.backend.finance.dto.Response.BorcTanimiResponseDTO( ");
        hql.append("   bt.id, bt.tutar, bt.borcTuru, bt.aciklama, bt.olusturulmaTarihi, bt.sonOdemeTarihi, bt.site.siteId ");
        hql.append(" ) ");
        hql.append(" FROM BorcTanimi bt WHERE 1=1 ");

        if (filtreDTO.getSiteId() != null) {
            hql.append(" AND bt.site.siteId = :siteId ");
        }


        if (filtreDTO.getBorcTuru() != null) {
            hql.append(" AND bt.borcTuru = :borcTuru ");
        }

        if (filtreDTO.getYil() != null) {
            hql.append(" AND bt.sonOdemeTarihi BETWEEN :yilBaslangic AND :yilBitis ");
        }

        Query<BorcTanimiResponseDTO> query = sessionFactory.getCurrentSession().createQuery(hql.toString(), BorcTanimiResponseDTO.class);

        if (filtreDTO.getSiteId() != null) {
            query.setParameter("siteId", filtreDTO.getSiteId());
        }


        if (filtreDTO.getBorcTuru() != null) {
            query.setParameter("borcTuru", filtreDTO.getBorcTuru());
        }

        if (filtreDTO.getYil() != null) {
            int yil = filtreDTO.getYil();
            LocalDate yilBaslangic = LocalDate.of(yil, 1, 1);
            LocalDate yilBitis = LocalDate.of(yil, 12, 31);
            query.setParameter("yilBaslangic", yilBaslangic);
            query.setParameter("yilBitis", yilBitis);
        }

        return query.list();
    }
}