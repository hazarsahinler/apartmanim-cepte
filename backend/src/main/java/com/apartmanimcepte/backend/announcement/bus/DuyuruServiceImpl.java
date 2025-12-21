package com.apartmanimcepte.backend.announcement.bus;

import com.apartmanimcepte.backend.announcement.Enum.OnemSeviyesiEnum;
import com.apartmanimcepte.backend.announcement.dao.DuyuruDAO;
import com.apartmanimcepte.backend.announcement.dto.request.DuyuruCreateRequestDTO;
import com.apartmanimcepte.backend.announcement.dto.response.DuyuruResponseDTO;
import com.apartmanimcepte.backend.announcement.entity.Duyuru;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import com.apartmanimcepte.backend.structure.dao.SiteDAO;
import com.apartmanimcepte.backend.structure.entity.Site;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DuyuruServiceImpl implements DuyuruService {

    private final SiteDAO siteDAO;
    private final DuyuruDAO duyuruDAO;

    public DuyuruServiceImpl(SiteDAO siteDAO, DuyuruDAO duyuruDAO) {
        this.siteDAO = siteDAO;
        this.duyuruDAO = duyuruDAO;
    }

    @Override
    @Transactional
    public ResponseDTO duyuruEkle(DuyuruCreateRequestDTO duyuruCreateRequestDTO) {
        Duyuru duyuru = new Duyuru();
        Site site = siteDAO.getObjectById(Site.class, duyuruCreateRequestDTO.getSiteId());
        duyuru.setDuyuruMesaji(duyuruCreateRequestDTO.getDuyuruMesaji());
        duyuru.setSite(site);
        duyuru.setOnemSeviyesi(duyuruCreateRequestDTO.getOnemSeviyesi());
        duyuru.setOlusturulmaTarihi(LocalDateTime.now());
        duyuru.setDuyuruBaslik(duyuruCreateRequestDTO.getDuyuruBaslik());
        duyuruDAO.saveOrUpdate(duyuru);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setMessage("Duyuru Başarıyla Eklendi.");
        return responseDTO;
    }

    @Override
    @Transactional
    public List<DuyuruResponseDTO> eklenenDuyurular(Long siteId, OnemSeviyesiEnum onemSeviyesi) {
        return duyuruDAO.getDuyurular(siteId, onemSeviyesi);
    }


}
