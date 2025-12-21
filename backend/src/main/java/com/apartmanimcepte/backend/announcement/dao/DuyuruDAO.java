package com.apartmanimcepte.backend.announcement.dao;

import com.apartmanimcepte.backend.announcement.Enum.OnemSeviyesiEnum;
import com.apartmanimcepte.backend.announcement.dto.response.DuyuruResponseDTO;
import com.apartmanimcepte.backend.identity.dao.BaseDAO;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class DuyuruDAO extends BaseDAO {

    private final SessionFactory sessionFactory;

    public DuyuruDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;

    }

    public List<DuyuruResponseDTO> getDuyurular(Long siteId, OnemSeviyesiEnum onemSeviyesi) {
        StringBuilder hql = new StringBuilder();

        hql.append(" SELECT NEW com.apartmanimcepte.backend.announcement.dto.response.DuyuruResponseDTO( ");
        hql.append("   d.duyuruId, d.duyuruMesaji, d.duyuruBaslik, d.olusturulmaTarihi, ");
        hql.append("   d.site.siteId, d.site.siteIsmi, ");
        hql.append("   d.onemSeviyesi ");
        hql.append(" ) ");
        hql.append(" FROM Duyuru d WHERE 1=1 ");

        // Site ID filtresi
        if (siteId != null) {
            hql.append(" AND d.site.siteId = :siteId ");
        }

        // Önem seviyesi filtresi
        if (onemSeviyesi != null) {
            hql.append(" AND d.onemSeviyesi = :onemSeviyesi ");
        }

        // Tarihe göre sıralama (yeni duyurular üstte)
        hql.append(" ORDER BY d.olusturulmaTarihi DESC ");

        Query<DuyuruResponseDTO> query = sessionFactory.getCurrentSession()
                .createQuery(hql.toString(), DuyuruResponseDTO.class);

        // Parametreleri set et
        if (siteId != null) {
            query.setParameter("siteId", siteId);
        }

        if (onemSeviyesi != null) {
            query.setParameter("onemSeviyesi", onemSeviyesi);
        }

        return query.list();
    }

}
