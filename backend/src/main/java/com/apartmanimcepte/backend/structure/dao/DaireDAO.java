package com.apartmanimcepte.backend.structure.dao;

import com.apartmanimcepte.backend.identity.dao.BaseDAO;
import com.apartmanimcepte.backend.structure.dto.ResponseDTO.DaireResponseByKullaniciDTO;
import com.apartmanimcepte.backend.structure.dto.ResponseDTO.DaireResponseDTO;
import net.sf.json.JSONArray;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;

@Repository
public class DaireDAO extends BaseDAO {
    private final SessionFactory sessionFactory;

    public DaireDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }

    public List<Long> getDaireIdsBySiteId(Long siteId) {
        StringBuilder hql = new StringBuilder();


        hql.append(" SELECT d.daireId ");
        hql.append(" FROM Daire d ");
        hql.append(" WHERE d.blok.site.siteId = :siteId ");


        org.hibernate.query.Query<Long> query = sessionFactory.getCurrentSession().createQuery(hql.toString(), Long.class);
        query.setParameter("siteId", siteId);

        List<Long> daireIdListesi = query.list();

        return daireIdListesi;
    }
    public List<DaireResponseByKullaniciDTO> getDaireByKullanici(String telefonNo) {
        if (telefonNo == null || telefonNo.trim().isEmpty()) {
            return Collections.emptyList();
        }

        StringBuilder hql = new StringBuilder();

        hql.append(" SELECT NEW com.apartmanimcepte.backend.structure.dto.ResponseDTO.DaireResponseByKullaniciDTO( ");
        hql.append("   d.daireId, ");
        hql.append("   d.daireNo, ");
        hql.append("   d.katNo, ");
        hql.append("   d.blok.blokId, ");
        hql.append("   d.blok.blokIsmi, ");
        hql.append("   d.blok.site.siteId, ");
        hql.append("   d.blok.site.siteIsmi, ");
        hql.append("   CONCAT(d.blok.site.siteMahalle, ' ', d.blok.site.siteSokak, ', ', d.blok.site.siteIlce, '/', d.blok.site.siteIl) ");
        hql.append(" ) ");
        hql.append(" FROM Daire d ");
        hql.append(" JOIN d.kullanicilar k ");
        hql.append(" WHERE k.telefonNo = :telefonNo ");
        Query<DaireResponseByKullaniciDTO> query = sessionFactory.getCurrentSession().createQuery(hql.toString(), DaireResponseByKullaniciDTO.class);
        query.setParameter("telefonNo", telefonNo);

        return query.list();
    }
}
