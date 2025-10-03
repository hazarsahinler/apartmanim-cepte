package com.apartmanimcepte.backend.structure.dao;

import com.apartmanimcepte.backend.identity.dao.BaseDAO;
import com.apartmanimcepte.backend.structure.entity.Site;
import net.sf.json.JSONArray;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class SiteDAO extends BaseDAO {
    private final SessionFactory sessionFactory;


    public SiteDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }

    /**
     * Aynı isim ve konumda (il, ilçe, mahalle, sokak) site olup olmadığını kontrol eder
     * @param siteIsmi Site ismi
     * @param siteIl İl
     * @param siteIlce İlçe
     * @param siteMahalle Mahalle
     * @param siteSokak Sokak
     * @return Eşleşen sitelerin listesi. Boş liste dönerse eşleşme yoktur.
     */
    public List<Site> checkSiteExistsByNameAndLocation(String siteIsmi, String siteIl, String siteIlce,
                                                       String siteMahalle, String siteSokak) {
        String hql = "FROM Site s WHERE s.siteIsmi = :siteIsmi " +
                "AND s.siteIl = :siteIl " +
                "AND s.siteIlce = :siteIlce " +
                "AND s.siteMahalle = :siteMahalle " +
                "AND s.siteSokak = :siteSokak";

        Query query = sessionFactory.getCurrentSession().createQuery(hql);
        query.setParameter("siteIsmi", siteIsmi);
        query.setParameter("siteIl", siteIl);
        query.setParameter("siteIlce", siteIlce);
        query.setParameter("siteMahalle", siteMahalle);
        query.setParameter("siteSokak", siteSokak);

        return query.list();
    }
}