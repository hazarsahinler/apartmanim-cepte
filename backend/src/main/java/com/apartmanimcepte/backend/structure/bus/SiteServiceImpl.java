package com.apartmanimcepte.backend.structure.bus;

import com.apartmanimcepte.backend.identity.dao.KullaniciDAO;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import com.apartmanimcepte.backend.identity.entity.Kullanici;
import com.apartmanimcepte.backend.structure.dao.SiteDAO;
import com.apartmanimcepte.backend.structure.dto.RequestDTO.SiteKayitDTO;
import com.apartmanimcepte.backend.structure.dto.ResponseDTO.SiteResponseDTO;
import com.apartmanimcepte.backend.structure.entity.Site;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SiteServiceImpl implements SiteService {
    private final KullaniciDAO kullaniciDAO;
    private final SiteDAO siteDAO;

    public SiteServiceImpl(KullaniciDAO kullaniciDAO, SiteDAO siteDAO) {
        this.kullaniciDAO = kullaniciDAO;
        this.siteDAO = siteDAO;
    }

    @Override
    public ResponseDTO SiteKayit(SiteKayitDTO siteKayitDTO) {
        ResponseDTO responseDTO = new ResponseDTO();

        Kullanici kullanici = kullaniciDAO.getObjectById(Kullanici.class, (int) siteKayitDTO.getYoneticiId());
        if (kullanici == null) {
            responseDTO.setMessage("Hata: Yönetici bulunamadı.");
            return responseDTO;
        }

        List<Site> existingSites = siteDAO.checkSiteExistsByNameAndLocation(
                siteKayitDTO.getSiteIsmi(),
                siteKayitDTO.getSiteIl(),
                siteKayitDTO.getSiteIlce(),
                siteKayitDTO.getSiteMahalle(),
                siteKayitDTO.getSiteSokak()
        );

        if (existingSites != null && !existingSites.isEmpty()) {
            responseDTO.setMessage("Hata: Bu konumda aynı isimli bir site zaten mevcut.");
            return responseDTO;
        } else {
            Site site = new Site();
            site.setSiteIsmi(siteKayitDTO.getSiteIsmi());
            site.setSiteIl(siteKayitDTO.getSiteIl());
            site.setSiteIlce(siteKayitDTO.getSiteIlce());
            site.setSiteMahalle(siteKayitDTO.getSiteMahalle());
            site.setSiteSokak(siteKayitDTO.getSiteSokak());
            site.setKullanici(kullanici);

            try {
                siteDAO.saveOrUpdate(site);
                responseDTO.setMessage("Site kaydı başarılı!");
                return responseDTO;
            } catch (Exception e) {
                responseDTO.setMessage("Site kaydı sırasında bir hata oluştu: " + e.getMessage());
                return responseDTO;
            }
        }
    }

    @Override
    public List<SiteResponseDTO> sitelerim(Long kullaniciId) {
        List<Site> siteList = siteDAO.getObjectsByParam(Site.class,"kullaniciId",kullaniciId);
        List<SiteResponseDTO> siteResponseDTOList = new ArrayList<>();
        if(siteList!=null && siteList.size()>0){
            for (Site site : siteList) {
                SiteResponseDTO siteResponseDTO = new SiteResponseDTO();
                siteResponseDTO.setSiteIsmi(site.getSiteIsmi());
                siteResponseDTO.setSiteIl(site.getSiteIl());
                siteResponseDTO.setSiteIlce(site.getSiteIlce());
                siteResponseDTO.setSiteMahalle(site.getSiteMahalle());
                siteResponseDTO.setSiteSokak(site.getSiteSokak());
                siteResponseDTOList.add(siteResponseDTO);
            }
            return siteResponseDTOList;
        }
        return null;
    }
}
