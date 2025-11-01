package com.apartmanimcepte.backend.structure.dao;

import com.apartmanimcepte.backend.identity.dao.BaseDAO;
import net.sf.json.JSONArray;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;

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
}
