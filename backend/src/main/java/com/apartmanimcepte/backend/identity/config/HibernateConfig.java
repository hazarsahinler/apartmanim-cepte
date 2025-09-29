package com.apartmanimcepte.backend.identity.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.orm.hibernate5.HibernateTransactionManager; // hibernate5 paket adı sizi yanıltmasın, Hibernate 6 ile de çalışır
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import javax.sql.DataSource;
import java.util.Properties;

@Configuration
@EnableTransactionManagement
public class HibernateConfig {

    // application.properties'ten değerleri okumak için bu kısım doğru
    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    // application.properties'ten diğer Hibernate ayarlarını da okuyalım
    @Value("${spring.jpa.properties.hibernate.dialect}")
    private String hibernateDialect;

    @Value("${spring.jpa.show-sql}")
    private boolean hibernateShowSql;

    @Value("${spring.jpa.hibernate.ddl-auto}")
    private String hibernateDdlAuto;



    @Value("${spring.jpa.properties.hibernate.format_sql}")
    private boolean hibernateFormatSql;

    // DataSource Bean'i, application.properties'ten gelen değerlerle oluşturuluyor. Bu doğru.
    @Bean
    public DataSource dataSource() {
        return DataSourceBuilder.create()
                .url(url)
                .driverClassName(driverClassName)
                .username(username)
                .password(password)
                .build();
    }

    // DOĞRUDAN SessionFactory OLUŞTURAN BEAN
    @Bean
    public LocalSessionFactoryBean sessionFactory() {
        LocalSessionFactoryBean sessionFactory = new LocalSessionFactoryBean();
        sessionFactory.setDataSource(dataSource());

        // Entity sınıflarınızın bulunduğu doğru paketi buraya yazın!
        sessionFactory.setPackagesToScan("com.apartmanimcepte.backend.identity.entity");

        sessionFactory.setHibernateProperties(hibernateProperties());

        return sessionFactory;
    }

    // SessionFactory ile çalışacak Transaction Manager
    @Bean
    public HibernateTransactionManager transactionManager() {
        HibernateTransactionManager transactionManager = new HibernateTransactionManager();
        // sessionFactory() metodunun oluşturduğu bean'in getObject() metodu ile SessionFactory'yi alıyoruz.
        transactionManager.setSessionFactory(sessionFactory().getObject());
        return transactionManager;
    }

    // application.properties'ten okunan değerlerle Hibernate özelliklerini oluşturur.
    private Properties hibernateProperties() {
        Properties properties = new Properties();
        properties.put("hibernate.dialect", hibernateDialect);
        properties.put("hibernate.show_sql", hibernateShowSql);
        properties.put("hibernate.hbm2ddl.auto", hibernateDdlAuto);
        properties.put("hibernate.format_sql", hibernateFormatSql);
        return properties;
    }
}