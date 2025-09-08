package co.edu.udem.ejemplodockercompose.repository;

import co.edu.udem.ejemplodockercompose.model.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {
}
