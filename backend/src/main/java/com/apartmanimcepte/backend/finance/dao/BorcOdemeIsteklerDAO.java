package com.apartmanimcepte.backend.finance.dao;

import com.apartmanimcepte.backend.finance.dto.Response.BorcOdemeIstekResponseDTO;
import com.apartmanimcepte.backend.finance.dto.Response.DaireBorcResponseDTO;
import com.apartmanimcepte.backend.finance.entity.BorcOdemeIstekler;
import com.apartmanimcepte.backend.finance.entity.DaireBorc;
import com.apartmanimcepte.backend.identity.dao.BaseDAO;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class BorcOdemeIsteklerDAO extends BaseDAO {
    private final SessionFactory sessionFactory;

    public BorcOdemeIsteklerDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }

    public List<BorcOdemeIstekResponseDTO> getOdemeIstekler(Long siteId) {
        StringBuilder hql = new StringBuilder();

        hql.append(" SELECT NEW com.apartmanimcepte.backend.finance.dto.Response.BorcOdemeIstekResponseDTO( ");
        // Hatalı kısım burada düzeltildi: d.daire.blok.blokIsmi -> d.daireBorc.daire.blok.blokIsmi
        hql.append("   d.id, d.daireBorc.id, d.daireBorc.daire.daireNo, d.daireBorc.daire.katNo, d.daireBorc.daire.blok.blokIsmi, d.istekTarihi ");
        hql.append(" ) ");
        hql.append(" FROM BorcOdemeIstekler d WHERE 1=1 ");
        hql.append(" AND d.onaylandiMi = false ");

        if (siteId != null) {
            hql.append(" AND d.daireBorc.daire.blok.site.siteId = :siteId ");
        }

        Query<BorcOdemeIstekResponseDTO> query = sessionFactory.getCurrentSession().createQuery(hql.toString(), BorcOdemeIstekResponseDTO.class);

        if (siteId != null) {
            query.setParameter("siteId", siteId);
        }

        return query.list();
    }

    public Optional<BorcOdemeIstekler> findPendingRequestByDaireBorc(DaireBorc daireBorc) {
        String hql = "FROM BorcOdemeIstekler d WHERE d.daireBorc = :daireBorc AND d.onaylandiMi = false";
        Query<BorcOdemeIstekler> query = sessionFactory.getCurrentSession().createQuery(hql, BorcOdemeIstekler.class);
        query.setParameter("daireBorc", daireBorc);
        return query.uniqueResultOptional();
    }

}
