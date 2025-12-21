package com.apartmanimcepte.backend.announcement.dto.request;

import com.apartmanimcepte.backend.announcement.Enum.OnemSeviyesiEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DuyuruCreateRequestDTO {

    @NotBlank(message = "Duyuru mesajı boş olamaz")
    @Size(min = 10, max = 2000, message = "Duyuru mesajı 10-2000 karakter arasında olmalıdır")
    private String duyuruMesaji;

    private String duyuruBaslik;

    @NotNull(message = "Site ID boş olamaz")
    private Long siteId;

    @NotNull(message = "Önem seviyesi boş olamaz")
    private OnemSeviyesiEnum onemSeviyesi;
}