package com.apartmanimcepte.backend.structure.bus;

import com.apartmanimcepte.backend.identity.dao.KullaniciDAO;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import com.apartmanimcepte.backend.identity.entity.Kullanici;
import com.apartmanimcepte.backend.structure.dao.BlokDAO;
import com.apartmanimcepte.backend.structure.dao.DaireDAO;
import com.apartmanimcepte.backend.structure.dao.SiteDAO;
import com.apartmanimcepte.backend.structure.dto.RequestDTO.BlokKayitDTO;
import com.apartmanimcepte.backend.structure.dto.RequestDTO.SiteKayitDTO;
import com.apartmanimcepte.backend.structure.dto.ResponseDTO.BlokResponseDTO;
import com.apartmanimcepte.backend.structure.dto.ResponseDTO.DaireResponseDTO;
import com.apartmanimcepte.backend.structure.dto.ResponseDTO.SiteResponseDTO;
import com.apartmanimcepte.backend.structure.entity.Blok;
import com.apartmanimcepte.backend.structure.entity.Daire;
import com.apartmanimcepte.backend.structure.entity.Site;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SiteServiceImpl implements SiteService {
    private final KullaniciDAO kullaniciDAO;
    private final SiteDAO siteDAO;
    private final DaireDAO daireDAO;
    private final BlokDAO blokDAO;

    public SiteServiceImpl(KullaniciDAO kullaniciDAO, SiteDAO siteDAO, DaireDAO daireDAO, BlokDAO blokDAO) {
        this.kullaniciDAO = kullaniciDAO;
        this.siteDAO = siteDAO;
        this.daireDAO = daireDAO;
        this.blokDAO = blokDAO;
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
        List<Kullanici> kullaniciList = kullaniciDAO.getObjectsByParam(Kullanici.class, "kullaniciId", kullaniciId);
        List<Site> siteList = siteDAO.getObjectsByParam(Site.class, "kullanici", kullaniciList.get(0));
        List<SiteResponseDTO> siteResponseDTOList = new ArrayList<>();
        if (siteList != null && siteList.size() > 0) {
            for (Site site : siteList) {
                SiteResponseDTO siteResponseDTO = new SiteResponseDTO();
                siteResponseDTO.setSiteIsmi(site.getSiteIsmi());
                siteResponseDTO.setSiteId(site.getSiteId());
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

    @Override
    public ResponseDTO BlokKayit(BlokKayitDTO blokKayitDTO) {
        ResponseDTO responseDTO = new ResponseDTO();

        if (blokKayitDTO != null) {
            try {
                // Blok oluştur
                Blok blok = new Blok();
                blok.setBlokIsmi(blokKayitDTO.getBlokIsmi());
                blok.setSite(siteDAO.getObjectById(Site.class, Math.toIntExact(blokKayitDTO.getSiteId())));
                blokDAO.saveOrUpdate(blok);

                int katSayisi = blokKayitDTO.getKatSayisi();
                int katBasiDaire = blokKayitDTO.getHerKattakiDaireSayisi();
                int k = 0;
                int a = 0;
                for (int i = 1; i <= katSayisi; i++) {
                    a = 0;
                    for (int j = k + 1; j <= katBasiDaire; j++) {
                        Daire daire = new Daire();
                        daire.setDaireNo(j);
                        daire.setKatNo(i);
                        daire.setBlok(blok);
                        daireDAO.saveOrUpdate(daire);
                        k = j;
                        a++;
                    }
                    katBasiDaire = katBasiDaire + a;


                }

                responseDTO.setMessage("Blok oluşturuldu, " + (katSayisi * katBasiDaire) + " daire eklendi!");
                return responseDTO;

            } catch (Exception e) {
                responseDTO.setMessage("Blok oluşturulurken hata: " + e.getMessage());
                return responseDTO;
            }
        }

        responseDTO.setMessage("HATA: BlokKayitDTO null!");
        return responseDTO;
    }

    @Override
    public List<BlokResponseDTO> getBloklar(Long siteId) {
        List<BlokResponseDTO> blokResponseDTOS = new ArrayList<>();
        List<Site> siteList = siteDAO.getObjectsByParam(Site.class, "siteId", siteId);
        try {
            List<Blok> blokList = blokDAO.getObjectsByParam(Blok.class, "site", siteList.get(0));

            for (Blok blok : blokList) {
                BlokResponseDTO blokResponseDTO = new BlokResponseDTO();
                blokResponseDTO.setBlokId(blok.getBlokId());
                blokResponseDTO.setBlokIsmi(blok.getBlokIsmi());
                blokResponseDTO.setSiteId(siteId);

                List<Daire> daireList = daireDAO.getObjectsByParam(Daire.class, "blok", blok);
                blokResponseDTO.setDaireSay(daireList.size());

                blokResponseDTOS.add(blokResponseDTO);
            }
        } catch (Exception e) {
            System.err.println("Blok listesi alınırken hata: " + e.getMessage());
        }

        return blokResponseDTOS;
    }

    @Override
    public List<DaireResponseDTO> getDaireler(Long blokId) {
        List<DaireResponseDTO> daireResponseDTOS = new ArrayList<>();
        List<Blok> blokList = blokDAO.getObjectsByParam(Blok.class, "blokId", blokId);
        try {
            List<Daire> daireList = daireDAO.getObjectsByParam(Daire.class, "blok", blokList.get(0));

            for (Daire daire : daireList) {
                DaireResponseDTO daireResponseDTO = new DaireResponseDTO();
                daireResponseDTO.setBlokId(blokId);
                daireResponseDTO.setDaireId(daire.getDaireId());
                daireResponseDTO.setDaireNo(daire.getDaireNo());
                daireResponseDTO.setKatNo(daire.getKatNo());
                if(daire.getKullanici()!=null){
                    daireResponseDTO.setKullaniciId(daire.getKullanici().getKullaniciId());

                }



                daireResponseDTOS.add(daireResponseDTO);
            }
        } catch (Exception e) {
            System.err.println("Blok listesi alınırken hata: " + e.getMessage());
        }

        return daireResponseDTOS;
    }

}
