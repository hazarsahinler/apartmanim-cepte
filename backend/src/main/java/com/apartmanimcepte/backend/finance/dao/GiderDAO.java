package com.apartmanimcepte.backend.finance.dao;

import com.apartmanimcepte.backend.finance.dto.Response.TotalApartmanGiderResponseDTO;
import com.apartmanimcepte.backend.identity.dao.BaseDAO;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

@Repository
public class GiderDAO extends BaseDAO {
    private final SessionFactory sessionFactory;
    public GiderDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }
    public TotalApartmanGiderResponseDTO getTotalApartmanGider(Long siteId) {
        StringBuilder hql = new StringBuilder();
        hql.append(" SELECT NEW com.apartmanimcepte.backend.finance.dto.Response.TotalApartmanGiderResponseDTO( ");
        hql.append("   COALESCE(SUM(d.giderTutari), 0.0) ");
        hql.append(" ) ");
        hql.append(" FROM Gider d WHERE 1=1 ");

        hql.append(" AND d.aktif = true ");

        if (siteId != null) {
            hql.append(" AND d.site.siteId = :siteId ");
        }

        Query<TotalApartmanGiderResponseDTO> query = sessionFactory.getCurrentSession()
                .createQuery(hql.toString(), TotalApartmanGiderResponseDTO.class);

        if (siteId != null) {
            query.setParameter("siteId", siteId);
        }

        return query.getSingleResult();
    }
}
