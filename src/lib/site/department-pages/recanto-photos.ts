import { createPhotoReader, type PhotoGallery } from '../photos.js';
import { RECANTO_LOGO_ALT } from '../recanto.js';

const photo = createPhotoReader(
	import.meta.glob<string>('../images/departamentos/recanto/*.webp', {
		eager: true,
		query: '?url',
		import: 'default',
	}),
);

export const RECANTO_COVER = photo('capa', RECANTO_LOGO_ALT);

const HEADQUARTERS = [
	photo('sede-01', 'Fachada azul da sede do Recanto de Potira, de três andares, com rampa de acesso'),
	photo(
		'sede-02',
		'Placa dos andares: térreo, Área de Promoção Social; 1º andar, Área de Saúde e de Orientação Jurídica; 2º andar, Área de Treinamento e Oficinas Profissionalizantes',
	),
	photo('sede-03', 'Salão com fileiras de cadeiras brancas'),
	photo('sede-04', 'Recepção com cadeiras de espera e portas das salas'),
	photo('sede-05', 'Consultório odontológico equipado'),
	photo('sede-06', 'Consultório com maca e pia'),
	photo('sede-07', 'Sala de atendimento com mesas e cadeiras'),
	photo('sede-08', 'Espaço amplo com uma mesa infantil roxa e cadeiras ao redor'),
];

const DELIVERIES = [
	photo('entregas-01', 'Voluntários reunidos na rampa da sede do Recanto de Potira'),
	photo('entregas-02', 'Gestantes e famílias sentadas no salão, com as feiras embaladas ao fundo'),
	photo('entregas-03', 'Voluntários falam ao público no salão antes da entrega'),
	photo('entregas-04', 'Salão lotado de mães e crianças'),
	photo('entregas-05', 'Voluntárias atendem as gestantes em uma mesa de cadastro'),
	photo('entregas-06', 'Voluntário entrega sacolas a mães e crianças'),
	photo('entregas-07', 'Bebê sorridente de touca rosa no colo da mãe'),
	photo('entregas-08', 'Crianças brincam de roda com voluntárias no salão decorado com balões'),
	photo('entregas-09', 'Crianças sentadas em tatames coloridos numa sala decorada'),
	photo('entregas-10', 'Meninas lancham sentadas no chão'),
	photo('entregas-11', 'Roda de crianças e voluntárias no salão decorado'),
	photo('entregas-12', 'Sacos de feira e de roupas empilhados ao lado da janela'),
	photo('entregas-13', 'Cobertores embalados e empilhados para a entrega'),
	photo('entregas-14', 'Voluntário carrega um saco de feira no ombro entre as famílias'),
	photo('entregas-15', 'Voluntário leva um saco de feira no ombro pelo salão'),
	photo('entregas-16', 'Voluntários distribuem sacolas às mães'),
	photo('entregas-17', 'Meninos sorridentes mostram os presentes recebidos'),
	photo('entregas-18', 'Famílias saem da sede do Recanto de Potira com as doações'),
	photo('entregas-19', 'Movimento de famílias em frente à sede do Recanto de Potira'),
];

const WORKSHOPS = [
	photo('oficinas-01', 'Educador conversa com crianças sentadas no tatame diante de uma projeção'),
	photo('oficinas-02', 'Oficina de escovação: crianças e mães assistem à apresentação projetada na parede'),
	photo('oficinas-03', 'Menino aprende a usar o fio dental com um voluntário'),
	photo('oficinas-04', 'Dentista de luvas examina a boca de uma menina'),
	photo('oficinas-05', 'Três crianças com acessórios da oficina de saúde bucal e kits de escova de dentes'),
	photo('oficinas-06', 'Crianças escovam os dentes em uma calha'),
	photo('oficinas-07', 'Mães com bebês no colo sentadas em roda durante a oficina'),
	photo('oficinas-08', 'Mães seguram e amamentam os bebês durante a oficina'),
	photo('oficinas-09', 'Gestantes e mães em oficina; uma voluntária segura um ursinho de pelúcia'),
	photo('oficinas-10', 'Voluntária arruma o cabelo de uma gestante, ao lado de uma menina'),
	photo('oficinas-11', 'Voluntária arruma o cabelo de uma mãe com o bebê no colo'),
	photo('oficinas-12', 'Voluntária pinta as unhas de duas meninas'),
	photo('oficinas-13', 'Voluntária maquia uma gestante diante de uma mesa de maquiagem'),
];

export const RECANTO_GALLERIES: readonly PhotoGallery[] = [
	{ titulo: 'Sede', fotos: HEADQUARTERS },
	{ titulo: 'Entregas', fotos: DELIVERIES },
	{ titulo: 'Oficinas para gestantes, mamães e crianças', fotos: WORKSHOPS },
];
